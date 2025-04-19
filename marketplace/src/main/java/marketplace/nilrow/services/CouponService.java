package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.coupon.*;
import java.math.BigDecimal;
import java.util.List;

public interface CouponService {
    CouponDTO create(CouponDTO dto);
    CouponDTO update(String id, CouponDTO dto);
    void    delete(String id);

    CouponDTO getById(String id);
    List<CouponDTO> getAll();
    CouponDTO getByCode(String catalogId, String code);

    CouponDTO addRadius(String couponId, CouponRadiusDTO dto);
    CouponDTO updateRadius(String couponId, CouponRadiusDTO dto);
    CouponDTO deleteRadius(String couponId, String radiusId);

    CouponAvailabilityDTO checkCoupon(String catalogId,
                                      String code,
                                      String userId,
                                      BigDecimal cartTotal,
                                      double lat,
                                      double lon,
                                      String productId,
                                      String categoryId,
                                      String subCategoryId);
}
