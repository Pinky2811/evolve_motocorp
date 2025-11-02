package com.evolve.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "prebooking")
public class Prebooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_no")
    private String receiptNo;

    @Column(name = "coupon_no")
    private String couponNo;

    private String name;
    private String address;
    private String contact;

    @Column(name = "booked_on", columnDefinition = "timestamp default current_timestamp")
    private LocalDateTime bookedOn;

    @PrePersist
    protected void onCreate() {
        this.bookedOn = LocalDateTime.now();
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReceiptNo() {
        return receiptNo;
    }

    public void setReceiptNo(String receiptNo) {
        this.receiptNo = receiptNo;
    }

    public String getCouponNo() {
        return couponNo;
    }

    public void setCouponNo(String couponNo) {
        this.couponNo = couponNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public LocalDateTime getBookedOn() {
        return bookedOn;
    }

    public void setBookedOn(LocalDateTime bookedOn) {
        this.bookedOn = bookedOn;
    }
}
