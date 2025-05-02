package marketplace.nilrow.services;

import marketplace.nilrow.domain.cart.Cart;
import marketplace.nilrow.domain.cart.CartItemDTO;
import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.coupon.*;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.*;
import marketplace.nilrow.util.PolygonUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
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
                             ProductRepository productRepo,
                             PeopleRepository peopleRepo,
                             ProductVariationRepository variationRepo) {
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

    @Override
    @Transactional
    public CouponDTO update(String id, CouponDTO dto) {

        Coupon c = couponRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        /* ----------- campos simples ----------- */
        c.setActive(dto.isActive());
        c.setDiscountType(dto.getDiscountType());
        c.setDiscountValue(dto.getDiscountValue());
        c.setPerUserLimit(dto.getPerUserLimit());
        c.setTotalLimit(dto.getTotalLimit());
        c.setStartsAt(dto.getStartsAt());
        c.setEndsAt(dto.getEndsAt());

        /* ----------- regras de escopo ----------- */
        // 1️⃣  Produtos enviados → limpamos categorias e subcategorias e SETamos produtos
        if (dto.getProductIds() != null) {
            c.setCategories(null);
            c.setSubCategories(null);
            if (dto.getProductIds().isEmpty()) {          // lista vazia ⇒ remove regra
                c.setProducts(null);
            } else {
                c.setProducts(productRepo.findAllById(dto.getProductIds())
                        .stream().collect(Collectors.toSet()));
            }
        }
        // 2️⃣  Sub-categorias enviadas → limpamos produtos e categorias e SETamos subcats
        else if (dto.getSubCategoryIds() != null) {
            c.setProducts(null);
            c.setCategories(null);
            if (dto.getSubCategoryIds().isEmpty()) {
                c.setSubCategories(null);
            } else {
                c.setSubCategories(subCategoryRepo.findAllById(dto.getSubCategoryIds())
                        .stream().collect(Collectors.toSet()));
            }
        }
        // 3️⃣  Categorias enviadas → limpamos produtos e subcats e SETamos categorias
        else if (dto.getCategoryIds() != null) {
            c.setProducts(null);
            c.setSubCategories(null);
            if (dto.getCategoryIds().isEmpty()) {
                c.setCategories(null);
            } else {
                c.setCategories(categoryRepo.findAllById(dto.getCategoryIds())
                        .stream().collect(Collectors.toSet()));
            }
        }

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
    public CouponDiscountDTO checkCoupon(String peopleId, CouponCheckRequest req) {

        /* ——— valida cupom ——— */
        Coupon c = couponRepo.findByCodeAndCatalogId(req.getCode(), req.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        if (!isGloballyValid(c))                                      // ativo, datas, limite total
            return new CouponDiscountDTO(false, BigDecimal.ZERO, "Cupom expirado ou inativo.");

        /* ——— checa geolocalização, se houver ——— */
        if (hasRadiusRestriction(c) && !isInsideAnyRadius(c, req))
            return new CouponDiscountDTO(false, BigDecimal.ZERO, "Cupom não disponível para essa região.");

        /* ——— filtra itens elegíveis ——— */
        boolean scoped   = hasExplicitScope(c);
        List<CartItemDTO> eligible = scoped
                ? filterEligibleItems(c, req.getItems())   // segue a hierarquia produto > subCat > cat
                : req.getItems();

        if (scoped && eligible.isEmpty())
            return new CouponDiscountDTO(false, BigDecimal.ZERO,
                    "Nenhum item do carrinho é elegível.");

        /* ——— soma subtotal elegível ——— */
        BigDecimal subtotal = eligible.stream()
                .map(this::priceOf)                 // pega o preço certo
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        /* ——— calcula desconto ——— */
        BigDecimal discount;
        if (c.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal pct = c.getDiscountValue(); // 10  ↦ 10 %
            // se alguém salvou 0.10, trate:
            if (pct.compareTo(BigDecimal.ONE) <= 0) {
                pct = pct.multiply(BigDecimal.valueOf(100));      // 0.10 → 10
            }
            discount = subtotal.multiply(pct).divide(BigDecimal.valueOf(100));
        } else { // FIXED_AMOUNT
            discount = c.getDiscountValue().min(subtotal);
        }

        int itemCount = eligible.stream()
                .mapToInt(i -> (i.getQuantity() == null || i.getQuantity() <= 0) ? 1 : i.getQuantity())
                .sum();

        String message = generateMessage(c, discount, itemCount);

        return new CouponDiscountDTO(true, discount, message);
    }

    /* ===== helpers ===== */

    private boolean hasExplicitScope(Coupon c) {
        return  (c.getProducts()      != null && !c.getProducts().isEmpty()) ||
                (c.getSubCategories() != null && !c.getSubCategories().isEmpty()) ||
                (c.getCategories()    != null && !c.getCategories().isEmpty());
    }

    private BigDecimal priceOf(CartItemDTO i) {

        int qty = (i.getQuantity() == null || i.getQuantity() <= 0)
                ? 1 : i.getQuantity();

        BigDecimal unit = i.getUnitPrice();   // sempre o preço unitário enviado

        return unit.multiply(BigDecimal.valueOf(qty));
    }


    private boolean isGloballyValid(Coupon c) {
        LocalDateTime now = LocalDateTime.now();
        return c.isActive()
                && (c.getStartsAt() == null || !now.isBefore(c.getStartsAt()))
                && (c.getEndsAt()   == null || !now.isAfter(c.getEndsAt()))
                && (c.getTotalUsed() < c.getTotalLimit());
    }

    private boolean hasRadiusRestriction(Coupon c) {
        return c.getRadii() != null && !c.getRadii().isEmpty();
    }

    private boolean isInsideAnyRadius(Coupon c, CouponCheckRequest req) {
        return c.getRadii().stream()
                .anyMatch(r -> PolygonUtils.isPointInPolygon(req.getLat(), req.getLon(), r.getCoordinates()));
    }

    private List<CartItemDTO> filterEligibleItems(Coupon c, List<CartItemDTO> items) {
        /* se o cupom especificou produtos, sub-categorias ou categorias,
           damos prioridade nessa ordem                       */

        if (c.getProducts() != null && !c.getProducts().isEmpty())
            return items.stream()
                    .filter(i -> c.getProducts().stream().anyMatch(p -> p.getId().equals(i.getProductId())))
                    .toList();

        if (c.getSubCategories() != null && !c.getSubCategories().isEmpty())
            return items.stream()
                    .filter(i -> {
                        Product prod = productRepo.findById(i.getProductId()).orElse(null);
                        return prod != null && prod.getSubCategory() != null
                                && c.getSubCategories().contains(prod.getSubCategory());
                    }).toList();

        if (c.getCategories() != null && !c.getCategories().isEmpty())
            return items.stream()
                    .filter(i -> {
                        Product prod = productRepo.findById(i.getProductId()).orElse(null);
                        return prod != null && prod.getSubCategory() != null
                                && c.getCategories().contains(prod.getSubCategory().getCategory());
                    }).toList();

        /* sem escopo => tudo do catálogo */
        return items;
    }

    private String generateMessage(Coupon c, BigDecimal discount, int itemCount) {

        /* -------- formatação brasileira -------- */
        DecimalFormatSymbols br = new DecimalFormatSymbols(new Locale("pt", "BR"));
        br.setDecimalSeparator(',');
        br.setGroupingSeparator('.');

        DecimalFormat pctFmt = new DecimalFormat("#0.##", br); // até 2 casas
        DecimalFormat money  = new DecimalFormat("#0.00", br);  // sempre 2 casas

        BigDecimal pct = c.getDiscountValue();
        if (pct.compareTo(BigDecimal.ONE) <= 0)               // 0,20  → 20
            pct = pct.multiply(BigDecimal.valueOf(100));

        String pctStr = pctFmt.format(pct) + "%";
        String valStr = money.format(discount);

        if (c.getDiscountType() == DiscountType.PERCENTAGE) {
            return String.format("%s de desconto aplicado em %d item(ns). Valor abatido: R$ %s",
                    pctStr, itemCount, valStr);
        } else { // FIXED_AMOUNT
            return String.format("Desconto fixo de R$ %s aplicado em %d item(ns).",
                    valStr, itemCount);
        }
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
