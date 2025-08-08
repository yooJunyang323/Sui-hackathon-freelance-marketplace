module sui_hire::marketplace;

// Framework
use sui::coin::{Self, Coin};
use sui::dynamic_object_field as dof;
// use sui::bag::{Self, Bag};
use sui::table::{Self, Table};
use sui::clock::{Self, Clock};

// Error Constants
const ENotOwner: u64 = 0;
const ENotFreelancer: u64 = 1;
const ENotBuyer: u64 = 2;
const ENotIntendedAddress: u64 = 3;

const EOrderNotPendingReview: u64 = 4;
const EOrderNotInProgress: u64 = 5;
const EOrderNotDelivered: u64 = 6;
// const EOrderNotRejected: u64 = 5;
const EOrderNotUnderAdminReview: u64 = 7;
// const EOrderAlreadyFinalized: u64 = 100;

const EServiceNotFound: u64 = 8;
const EOrderNotFound: u64 = 9;
const EAmountIncorrect: u64 = 10;
const EGracePeriodNotEnded: u64 = 11;

const EURLTooLong: u64 = 12;
const EHashTooLong: u64 = 13;

// Order Status Constants
const STATUS_PENDING_REVIEW: u8 = 0;
const STATUS_IN_PROGRESS: u8 = 1;
const STATUS_DELIVERED: u8 = 2;
const STATUS_REJECTED: u8 = 3;
// const STATUS_ACCEPTED: u8 = 2;
const STATUS_UNDER_ADMIN_REVIEW: u8 = 4;
// const STATUS_ADMIN_APPROVED_REFUND: u8 = 5;
// const STATUS_REFUNDED: u8 = 6;

public struct AdminCap has key, store {
    id: UID,
}

public struct FreelancerCap has key, store {
    id: UID,
}

public struct BuyerCap has key, store {
    id: UID,
}

public struct Marketplace<phantom COIN> has key {
    id: UID,
    // Table to hold 'Service' listings by object ID
    services: Table<ID, Service>,
    // Table to hold 'Order' objects by Order ID
    orders: Table<ID, Order<COIN>>,
    // Table to hold 'Disputed Order' objects by Order ID
    disputed_orders: Table<ID, Order<COIN>>,
}

// A Service listing with details
public struct Service has key, store {
    id: UID,
    owner: address,
    title: vector<u8>,
    description: vector<u8>,
    price: u64,
    deliverables: vector<u8>,
    expected_time: u64,
}

// An ongoing project.
// Holds locked funds (escrow) and tracks the state of the deal
public struct Order<phantom COIN> has key, store {
    id: UID,
    buyer: address,
    freelancer: address,
    // Locked coin before product submit to client
    escrow: Coin<COIN>,
    // Buyer submit requirement in form of URL
    requirements_url: vector<u8>,
    // Freelancer submit Github commit hash (Ensure nothing is being modified after submission - Like fingerprint)
    // So Buyer can use the commit hash to navigate to the exact version of the code that was submitted
    github_commit_hash: vector<u8>,
    // Timestamp when delivery grace period ends
    delivery_deadline: u64,
    // Status of order [0, 1, 2, 3, 4]
    status: u8,
}
// A private object that holds the URL. It is "wrapped" inside the `DeliverableWrapper`.
// It has `store` but NOT `key`, so it can't be a standalone public object
public struct Deliverable has key, store {
    id: UID,
    github_repo_url: vector<u8>,
}

public struct DeliverableWrapper has key {
    id: UID,
    deliverable: Deliverable,
    intended_address: address,
}

fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    transfer::transfer(admin_cap, ctx.sender());
}

// ============================= ADMIN FUNCTION =============================
// Create new marketplace by the owner of SuiLance
public fun create_marketplace<COIN>(
    _: &AdminCap,
    ctx: &mut TxContext
) {
    let id = object::new(ctx);
    let services = table::new<ID, Service>(ctx);
    let orders = table::new<ID, Order<COIN>>(ctx);
    let disputed_orders = table::new<ID, Order<COIN>>(ctx);

    let new_marketplace = Marketplace<COIN> {
        id,
        services,
        orders,
        disputed_orders,
    };

    // Make it shared object
    transfer::share_object(new_marketplace)
}

// ============================= FREELANCER FUNCTION =============================
// Freelancer listing a service on the marketplace
public fun list_service<COIN>(
    _: &FreelancerCap,
    marketplace: &mut Marketplace<COIN>,
    title: vector<u8>,
    description: vector<u8>,
    price: u64,
    deliverables: vector<u8>,
    expected_time: u64,
    ctx: &mut TxContext,
) {
    let service = Service {
        id: object::new(ctx),
        owner: ctx.sender(),
        title,
        description,
        price,
        deliverables,
        expected_time,
    };

    let service_id = object::id(&service);
    marketplace.services.add(service_id, service);
}

// Freelancer withdraws a service from the marketplace
#[allow(lint(self_transfer))]
public fun withdraw_service<COIN>(
    _: &FreelancerCap,
    marketplace: &mut Marketplace<COIN>,
    service_id: ID,
    ctx: &mut TxContext,
) {
    // Ensure the service exists
    assert!(marketplace.services.contains(service_id), EServiceNotFound);
    
    // Ensure the sender is the owner of the service
    let service = marketplace.services.borrow(service_id);
    assert!(ctx.sender() == service.owner, ENotOwner);

    // Remove the service from the marketplace & transfer it back to the owner
    let service = marketplace.services.remove(service_id);
    transfer::transfer(service, ctx.sender());
}

// Freelancer accepts buyer requirment/proposal to work on
public fun accept_order<COIN>(
    _: &FreelancerCap,
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    ctx: &mut TxContext,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);
    let order = marketplace.orders.borrow_mut(order_id);

    assert!(ctx.sender() == order.freelancer, ENotFreelancer);
    assert!(order.status == STATUS_PENDING_REVIEW, EOrderNotPendingReview);

    order.status = STATUS_IN_PROGRESS;
}

// Freelancer reject buyer requirment/proposal to work on
public fun reject_order<COIN>(
    _: &FreelancerCap,
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    ctx: &mut TxContext,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);

    let Order {
        id: mut order_uid,
        buyer,
        freelancer,
        escrow,
        status,
        ..
    } = marketplace.orders.remove(order_id);

    assert!(ctx.sender() == freelancer, ENotFreelancer);
    assert!(status == STATUS_PENDING_REVIEW, EOrderNotPendingReview);

    let service: Service = dof::remove(&mut order_uid, b"service");
    let service_id = object::id(&service);
    marketplace.services.add(service_id, service);

    // Refund back to buyer
    transfer::public_transfer(escrow, buyer);
    object::delete(order_uid);
}

// Freelancer delivers the work by providing a demo link
public fun deliver_work<COIN>(
    _: &FreelancerCap,
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    github_repo_url: vector<u8>,
    github_commit_hash: vector<u8>,
    ctx: &mut TxContext,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);
    let order = marketplace.orders.borrow_mut(order_id);

    // Ensure only the respective freelancer can delivery the work
    assert!(ctx.sender() == order.freelancer, ENotFreelancer);
    assert!(order.status == STATUS_IN_PROGRESS, EOrderNotInProgress);

    let max_url_length = 256; // Validation for Github Repo URL length
    let max_hash_length = 40; // SHA-1 hash is 40 characters long

    assert!(vector::length(&github_repo_url) <= max_url_length, EURLTooLong);
    assert!(vector::length(&github_commit_hash) <= max_hash_length, EHashTooLong);

    order.github_commit_hash = github_commit_hash;
    order.status = STATUS_DELIVERED;

    // Create wrapped Deliverable object and transfer to freelancer
    let deliverable = Deliverable {
        id: object::new(ctx),
        github_repo_url,
    };

    let deliverable_wrapper = DeliverableWrapper {
        id: object::new(ctx),
        deliverable,
        intended_address: order.buyer,
    };

    transfer::transfer(deliverable_wrapper, order.buyer);
}

// ============================= BUYER FUNCTION =============================
// Buyer purchase service
public fun purchase_service<COIN>(
    _: &BuyerCap,
    marketplace: &mut Marketplace<COIN>,
    service_id: ID,
    payment: Coin<COIN>,
    requirements_url: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    // Assert that the service exist, remove it temp from the table (service listing)
    assert!(marketplace.services.contains(service_id), EServiceNotFound);
    let service = marketplace.services.remove(service_id);

    // Ensure ask price match
    assert!(coin::value(&payment) == service.price, EAmountIncorrect);

    // Validation for requirement URL length
    let max_url_length = 256;
    assert!(vector::length(&requirements_url) <= max_url_length, EURLTooLong);

    // Escrow - Deadline calculation
    let delivery_deadline = clock::timestamp_ms(clock) + service.expected_time;

    // Escrow - Create Order object
    let mut order = Order {
        id: object::new(ctx),
        buyer: ctx.sender(),
        freelancer: service.owner,
        escrow: payment,
        requirements_url,
        github_commit_hash: b"",
        delivery_deadline,
        status: STATUS_PENDING_REVIEW,
    };

    // Attach Service object to the Order object using df
    // LOCK the service to the order as proof of the contract
    dof::add(&mut order.id, b"service", service);

    // Save order to marketplace order table
    let order_id = object::id(&order);
    marketplace.orders.add(order_id, order);
}

// Buyer accept the delivered work, release funds to freelancer
public fun accept_delivery<COIN>(
    _: &BuyerCap,
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    deliverable_wrapper: DeliverableWrapper, //Github repo wrapped inside here
    ctx: &mut TxContext,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);

    let Order {
        id: mut order_uid,
        buyer,
        freelancer,
        escrow,
        status,
        ..
    } = marketplace.orders.remove(order_id);
    // Ensure only the respective buyer can accept the work
    assert!(ctx.sender() == buyer, ENotBuyer);
    assert!(status == STATUS_DELIVERED, EOrderNotDelivered);

    // Make sure sender is intended receipent of the deliverable
    assert!(deliverable_wrapper.intended_address == ctx.sender(), ENotIntendedAddress);

    let DeliverableWrapper {
        id,
        deliverable,
        ..
    } = deliverable_wrapper;

    // Transfer deliverable to buyer
    transfer::transfer(deliverable, buyer);
    // Delete deliverable wrapper
    object::delete(id);

    // Transfer back the locked Service object back to freelancer
    let service: Service = dof::remove(&mut order_uid, b"service");
    transfer::transfer(service, freelancer);
    
    // Transfer funds to freelancer
    transfer::public_transfer(escrow, freelancer);
    object::delete(order_uid);
}

// Buyer reject the delivered work and get back funds
public fun reject_delivery<COIN>(
    _: &BuyerCap,
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    deliverable_wrapper: DeliverableWrapper,
    ctx: &mut TxContext,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);

    let Order {
        id: mut order_uid,
        buyer,
        freelancer,
        escrow,
        status,
        ..
    } = marketplace.orders.remove(order_id);

    assert!(ctx.sender() == buyer, ENotBuyer);
    assert!(status == STATUS_DELIVERED, EOrderNotDelivered);

    let DeliverableWrapper {
        id,
        deliverable,
        ..
    } = deliverable_wrapper;

    transfer::transfer(deliverable, freelancer);
    object::delete(id);

    let service: Service = dof::remove(&mut order_uid, b"service");
    transfer::transfer(service, freelancer);

    transfer::public_transfer(escrow, buyer);
    object::delete(order_uid);
}
    
// Extend the delivery deadline for the order
public fun extend_delivery_deadline<COIN>(
    _: &BuyerCap,
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    additional_time_in_ms: u64,
    ctx: &mut TxContext,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);
    let order = marketplace.orders.borrow_mut(order_id);

    // Ensure only the respective buyer can extend the deadline
    assert!(ctx.sender() == order.buyer, ENotBuyer);
    assert!(order.status == STATUS_IN_PROGRESS, EOrderNotInProgress);

    // Extend the delivery deadline
    order.delivery_deadline = order.delivery_deadline + additional_time_in_ms;
}

// ============================= PUBLIC FUNCTION =============================
// Handles auto-release of funds if the grace period expires
// and buyer doesn't take any action
public fun finalize_order_after_timeout<COIN>(
    marketplace: &mut Marketplace<COIN>,
    order_id: ID,
    clock: &Clock,
) {
    assert!(marketplace.orders.contains(order_id), EOrderNotFound);

    let Order {
        id: mut order_uid,
        freelancer,
        escrow,
        delivery_deadline,
        status,
        ..
    } = marketplace.orders.remove(order_id);

    assert!(status == STATUS_DELIVERED, EOrderNotDelivered);
    assert!(clock::timestamp_ms(clock) > delivery_deadline, EGracePeriodNotEnded);

    // Transfer back the locked Service object back to freelancer
    let service: Service = dof::remove(&mut order_uid, b"service");
    transfer::transfer(service, freelancer);
    
    // Transfer funds to freelancer
    transfer::public_transfer(escrow, freelancer);
    object::delete(order_uid);
}

// ============================= ADMIN FUNCTION =============================
// Admin refund the funds to buyer after reviewing and approved the rejection and reason by buyer

// ============== NOTES: MAKE IT BATCH RELEASE FUNDS USING PTB ==============
public fun add_additional_admin(
    _: &AdminCap,
    new_admin_address: address,
    ctx: &mut TxContext,
) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    transfer::transfer(admin_cap, new_admin_address);
}

public fun add_freelancer(
    _: &AdminCap,
    new_freelancer_address: address,
    ctx: &mut TxContext,
) {
    let freelancer_cap = FreelancerCap {
        id: object::new(ctx),
    };

    transfer::transfer(freelancer_cap, new_freelancer_address);
}

public fun add_buyer(
    _: &AdminCap,
    new_buyer_address: address,
    ctx: &mut TxContext,
) {
    let buyer_cap = BuyerCap {
        id: object::new(ctx),
    };

    transfer::transfer(buyer_cap, new_buyer_address);
}