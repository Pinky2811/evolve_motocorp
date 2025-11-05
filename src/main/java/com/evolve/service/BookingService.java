package com.evolve.service;

import com.evolve.Repository.PrebookingRepository;
import com.evolve.Repository.VoucherRepository;
import com.evolve.model.Prebooking;
import com.evolve.model.Voucher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    @Autowired
    private VoucherRepository voucherRepo;

    @Autowired
    private PrebookingRepository prebookingRepo;

    @Transactional
    public Prebooking confirmBooking(String name, String address, String mobile) {
        // 1. Get one unused voucher
        Voucher voucher = voucherRepo.findFirstByUsedFalse();
        if (voucher == null) {
            throw new RuntimeException("No vouchers available!");
        }

        // 2. Save booking details
        Prebooking booking = new Prebooking();
        booking.setName(name);
        booking.setAddress(address);
        booking.setContact(mobile);
        booking.setReceiptNo(voucher.getReceiptNo());
        booking.setCouponNo(voucher.getCouponNo());
        prebookingRepo.save(booking);

        // 3. Mark voucher used
        voucher.setUsed(true);
        voucherRepo.save(voucher);

        return booking;
    }
}
