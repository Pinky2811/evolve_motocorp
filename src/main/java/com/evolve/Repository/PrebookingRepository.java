package com.evolve.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.evolve.model.Prebooking;

public interface PrebookingRepository extends JpaRepository<Prebooking, Long> {

    @Query(value = "SELECT p.id, p.name, p.address, p.contact, p.receipt_no, p.coupon_no, p.booked_on FROM prebooking p", nativeQuery = true)
    List<Object[]> fetchAdminPrebookings();

    boolean existsByReceiptNo(String receiptNo); // ✅ this works

}
