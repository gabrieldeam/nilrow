package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.coupon.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, String> {
    Optional<Coupon> findByCodeAndCatalogId(String code, String catalogId);
}
