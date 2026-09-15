package com.mongilbasket.settings;

import java.math.BigDecimal;
import java.time.Instant;

import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Singleton row (fixed id=1) holding academy-wide fee settings, editable by the admin. */
@Entity
@Table(name = "app_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSettings {

    @Id
    @Builder.Default
    private Integer id = 1;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal membershipFeeMonthly;

    /** Paid once per season, not monthly. */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal insuranceFeeYearly;

    /** Standard team kit price, regardless of size. */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal kitFee;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
