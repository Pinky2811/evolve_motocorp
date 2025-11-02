package com.evolve.model;

public class VoucherRangeRequest {
    private String receiptStart;
    private String receiptEnd;
    private String couponStart;
    private String couponEnd;

    public String getReceiptStart() {
        return receiptStart;
    }

    public void setReceiptStart(String receiptStart) {
        this.receiptStart = receiptStart;
    }

    public String getReceiptEnd() {
        return receiptEnd;
    }

    public void setReceiptEnd(String receiptEnd) {
        this.receiptEnd = receiptEnd;
    }

    public String getCouponStart() {
        return couponStart;
    }

    public void setCouponStart(String couponStart) {
        this.couponStart = couponStart;
    }

    public String getCouponEnd() {
        return couponEnd;
    }

    public void setCouponEnd(String couponEnd) {
        this.couponEnd = couponEnd;
    }

}
