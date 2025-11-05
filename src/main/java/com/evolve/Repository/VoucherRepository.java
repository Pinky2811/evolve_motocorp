package com.evolve.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.evolve.model.Voucher;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    // Get one random unused voucher
    @Query(value = "SELECT * FROM vouchers WHERE used = false ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Voucher getRandomUnusedVoucher();

    // Fetch first unused voucher
    Voucher findFirstByUsedFalse();

    // Find vouchers between receipt numbers
    List<Voucher> findByReceiptNoBetween(String start, String end);

    // Fetch vouchers not booked
    @Query("SELECT v FROM Voucher v " +
            "WHERE v.used = false " +
            "AND v.receiptNo NOT IN (SELECT p.receiptNo FROM Prebooking p)")
    List<Voucher> findUnusedVouchersNotBooked();

    // Delete by receipt number
    @Transactional
    @Modifying
    @Query("DELETE FROM Voucher v WHERE v.receiptNo = :receiptNo")
    void deleteByReceiptNo(@Param("receiptNo") String receiptNo);

    boolean existsByReceiptNo(String receiptNo);

}
