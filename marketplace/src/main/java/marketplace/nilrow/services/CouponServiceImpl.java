package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.coupon.*;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.repositories.*;
import marketplace.nilrow.util.PolygonUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepo;
    private final CatalogRepository catalogRepo;
    private final CategoryRepository categoryRepo;
    private final SubCategoryRepository subCategoryRepo;
    private final ProductRepository productRepo;

    public CouponServiceImpl(CouponRepository couponRepo,
                             CatalogRepository catalogRepo,
                             CategoryRepository categoryRepo,
                             SubCategoryRepository subCategoryRepo,
                             ProductRepository productRepo) {
        this.couponRepo      = couponRepo;
        this.catalogRepo     = catalogRepo;
        this.categoryRepo    = categoryRepo;
        this.subCategoryRepo = subCategoryRepo;
        this.productRepo     = productRepo;
    }

    /* ---------- CRUD principal ---------- */

    @Override public CouponDTO create(CouponDTO dto) {
        return toDTO(couponRepo.save(toEntity(dto)));
    }

    @Override public CouponDTO update(String id, CouponDTO dto) {
        Coupon c = couponRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        c.setActive(dto.isActive());
        c.setDiscountType(dto.getDiscountType());
        c.setDiscountValue(dto.getDiscountValue());
        c.setPerUserLimit(dto.getPerUserLimit());
        c.setTotalLimit(dto.getTotalLimit());
        c.setStartsAt(dto.getStartsAt());
        c.setEndsAt(dto.getEndsAt());
        return toDTO(couponRepo.save(c));
    }

    @Override public void delete(String id) {
        couponRepo.deleteById(id);
    }

    @Override public CouponDTO getById(String id) {
        return toDTO(couponRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado")));
    }

    @Override public List<CouponDTO> getAll() {
        return couponRepo.findAll().stream().map(this::toDTO).toList();
    }

    @Override public CouponDTO getByCode(String catalogId, String code) {
        return couponRepo.findByCodeAndCatalogId(code, catalogId)
                .map(this::toDTO).orElse(null);
    }

    /* ---------- Radii ---------- */

    @Transactional
    @Override public CouponDTO addRadius(String couponId, CouponRadiusDTO dto) {
        Coupon c = couponRepo.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        if (c.getRadii() == null) c.setRadii(new ArrayList<>());
        c.getRadii().add(toEntity(dto, c));
        return toDTO(couponRepo.save(c));
    }

    @Transactional
    @Override public CouponDTO updateRadius(String couponId, CouponRadiusDTO dto) {
        Coupon c = couponRepo.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        CouponRadius r = c.getRadii().stream()
                .filter(rr -> rr.getId().equals(dto.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Raio não encontrado"));
        r.setRadius(dto.getRadius());
        r.getCoordinates().clear();
        r.getCoordinates().addAll(toCoordinateEntities(dto.getCoordinates(), r));
        return toDTO(couponRepo.save(c));
    }

    @Transactional
    @Override public CouponDTO deleteRadius(String couponId, String radiusId) {
        Coupon c = couponRepo.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        c.getRadii().removeIf(r -> r.getId().equals(radiusId));
        return toDTO(couponRepo.save(c));
    }

    /* ---------- Verificação de elegibilidade ---------- */

    @Override
    public CouponAvailabilityDTO checkCoupon(String catalogId,
                                             String code,
                                             String userId,
                                             BigDecimal cartTotal,
                                             double lat,
                                             double lon,
                                             String productId,
                                             String categoryId,
                                             String subCategoryId) {

        Coupon c = couponRepo.findByCodeAndCatalogId(code, catalogId)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        /* --- regras básicas --- */

        boolean valid = c.isActive()
                && (c.getStartsAt() == null || c.getStartsAt().isBefore(java.time.LocalDateTime.now()))
                && (c.getEndsAt() == null   || c.getEndsAt().isAfter(java.time.LocalDateTime.now()))
                && (c.getTotalUsed() < c.getTotalLimit());

        if (!valid) return new CouponAvailabilityDTO(false, BigDecimal.ZERO);

        /* --- checa geolocalização (se houver) --- */
        if (c.getRadii() != null && !c.getRadii().isEmpty()) {
            boolean inside = c.getRadii().stream()
                    .anyMatch(r -> PolygonUtils.isPointInPolygon(lat, lon, r.getCoordinates()));
            if (!inside)
                return new CouponAvailabilityDTO(false, BigDecimal.ZERO);
        }

        /* --- checa escopo (produto / categoria / subcategoria) --- */
        if (c.getProducts() != null && !c.getProducts().isEmpty()
                && productId != null && !c.getProducts().stream().anyMatch(p -> p.getId().equals(productId)))
            return new CouponAvailabilityDTO(false, BigDecimal.ZERO);

        if (c.getSubCategories() != null && !c.getSubCategories().isEmpty()
                && subCategoryId != null && !c.getSubCategories().stream().anyMatch(s -> s.getId().equals(subCategoryId)))
            return new CouponAvailabilityDTO(false, BigDecimal.ZERO);

        if (c.getCategories() != null && !c.getCategories().isEmpty()
                && categoryId != null && !c.getCategories().stream().anyMatch(cat -> cat.getId().equals(categoryId)))
            return new CouponAvailabilityDTO(false, BigDecimal.ZERO);

        /* --- calcula o desconto --- */
        BigDecimal discount = c.getDiscountType() == DiscountType.PERCENTAGE
                ? cartTotal.multiply(c.getDiscountValue()).divide(BigDecimal.valueOf(100))
                : c.getDiscountValue();

        return new CouponAvailabilityDTO(true, discount);
    }

    /* ---------- mapeamentos ---------- */

    private CouponDTO toDTO(Coupon c) {
        CouponDTO dto = new CouponDTO();
        dto.setId(c.getId());
        dto.setCode(c.getCode());
        dto.setCatalogId(c.getCatalog().getId());
        dto.setActive(c.isActive());
        dto.setDiscountType(c.getDiscountType());
        dto.setDiscountValue(c.getDiscountValue());
        dto.setPerUserLimit(c.getPerUserLimit());
        dto.setTotalLimit(c.getTotalLimit());
        dto.setTotalUsed(c.getTotalUsed());
        dto.setStartsAt(c.getStartsAt());
        dto.setEndsAt(c.getEndsAt());

        if (c.getCategories() != null)
            dto.setCategoryIds(c.getCategories().stream().map(Category::getId).collect(Collectors.toSet()));
        if (c.getSubCategories() != null)
            dto.setSubCategoryIds(c.getSubCategories().stream().map(SubCategory::getId).collect(Collectors.toSet()));
        if (c.getProducts() != null)
            dto.setProductIds(c.getProducts().stream().map(Product::getId).collect(Collectors.toSet()));

        if (c.getRadii() != null)
            dto.setRadii(c.getRadii().stream().map(this::toDTO).toList());

        return dto;
    }

    private CouponRadiusDTO toDTO(CouponRadius r) {
        CouponRadiusDTO dto = new CouponRadiusDTO();
        dto.setId(r.getId());
        dto.setRadius(r.getRadius());
        dto.setCoordinates(r.getCoordinates().stream()
                .map(c -> new CouponCoordinateDTO(c.getId(), c.getLatitude(), c.getLongitude()))
                .toList());
        return dto;
    }

    private Coupon toEntity(CouponDTO dto) {

        Coupon c = new Coupon();
        c.setCode(dto.getCode());
        c.setActive(dto.isActive());
        c.setDiscountType(dto.getDiscountType());
        c.setDiscountValue(dto.getDiscountValue());
        c.setPerUserLimit(dto.getPerUserLimit());
        c.setTotalLimit(dto.getTotalLimit());
        c.setStartsAt(dto.getStartsAt());
        c.setEndsAt(dto.getEndsAt());

        Catalog catalog = catalogRepo.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catálogo não encontrado"));
        c.setCatalog(catalog);

        if (dto.getCategoryIds() != null)
            c.setCategories(categoryRepo.findAllById(dto.getCategoryIds()).stream().collect(Collectors.toSet()));
        if (dto.getSubCategoryIds() != null)
            c.setSubCategories(subCategoryRepo.findAllById(dto.getSubCategoryIds()).stream().collect(Collectors.toSet()));
        if (dto.getProductIds() != null)
            c.setProducts(productRepo.findAllById(dto.getProductIds()).stream().collect(Collectors.toSet()));

        if (dto.getRadii() != null)
            c.setRadii(dto.getRadii().stream().map(r -> toEntity(r, c)).toList());

        return c;
    }

    private CouponRadius toEntity(CouponRadiusDTO dto, Coupon parent) {
        CouponRadius r = new CouponRadius();
        r.setCoupon(parent);
        r.setRadius(dto.getRadius());
        r.setCoordinates(toCoordinateEntities(dto.getCoordinates(), r));
        return r;
    }

    private List<CouponCoordinate> toCoordinateEntities(List<CouponCoordinateDTO> dtos, CouponRadius r) {
        if (dtos == null) return new ArrayList<>();
        return dtos.stream().map(d -> {
            CouponCoordinate c = new CouponCoordinate();
            c.setCouponRadius(r);
            c.setLatitude(d.getLatitude());
            c.setLongitude(d.getLongitude());
            return c;
        }).toList();
    }
}
