package marketplace.nilrow.services;

import marketplace.nilrow.domain.cart.*;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.CartRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.ProductRepository;
import marketplace.nilrow.repositories.ProductVariationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final ProductVariationRepository variationRepo;
    private final PeopleRepository peopleRepo;

    public CartService(CartRepository cartRepo,
                       ProductRepository productRepo,
                       ProductVariationRepository variationRepo,
                       PeopleRepository peopleRepo) {
        this.cartRepo      = cartRepo;
        this.productRepo   = productRepo;
        this.variationRepo = variationRepo;
        this.peopleRepo    = peopleRepo;
    }

    /* ------------------------------------------------------------------
     *  addOrUpdateItem – versão ligada ao People logado
     * ------------------------------------------------------------------ */
    @Transactional
    public CartDTO addOrUpdateItem(String peopleId, CartItemRequest req) {

        if ((req.getProductId() == null || req.getProductId().isBlank())
                && (req.getVariationId() == null || req.getVariationId().isBlank())) {
            throw new IllegalArgumentException("Envie productId ou variationId");
        }
        if (req.getQuantity() == null || req.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser > 0");
        }

        /* -------- recupera People e carrinho (ou cria) -------- */
        People people = peopleRepo.findById(peopleId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Cart cart = cartRepo.findByPeopleId(peopleId)
                .orElseGet(() -> {          // cria novo carrinho vazio
                    Cart c = new Cart();
                    c.setPeople(people);
                    return c;
                });

        String productId   = req.getProductId();
        String variationId = req.getVariationId();

        // Se veio apenas variationId → localizar productId
        if ((productId == null || productId.isBlank()) && variationId != null) {
            ProductVariation var = variationRepo.findById(variationId)
                    .orElseThrow(() -> new RuntimeException("Variação não encontrada"));
            productId = var.getProduct().getId();
        }

        /* cópias finais p/ lambda */
        final String pid = productId;
        final String vid = variationId;

        /* procura item existente */
        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getProductId().equals(pid) &&
                        ((vid == null && ci.getVariationId() == null) ||
                                (vid != null && vid.equals(ci.getVariationId()))))
                .findFirst()
                .orElse(null);

        if (item == null) {           // novo item
            item = new CartItem();
            item.setCart(cart);
            item.setProductId(pid);
            item.setVariationId(vid);
            item.setQuantity(req.getQuantity());
            cart.getItems().add(item);
        } else {                      // apenas ajusta qtd.
            item.setQuantity(req.getQuantity());
        }

        Cart saved = cartRepo.save(cart);
        return toDTO(saved);
    }

    /* -------- getCart permanece igual, só muda para peopleId -------- */
    @Transactional(readOnly = true)
    public CartDTO getCart(String peopleId) {
        Cart cart = cartRepo.findByPeopleId(peopleId)
                .orElseGet(() -> {               // devolve carrinho vazio
                    Cart c = new Cart();
                    c.setPeople( peopleRepo.findById(peopleId)
                            .orElseThrow(() -> new RuntimeException("Usuário não encontrado")) );
                    return c;
                });
        return toDTO(cart);
    }

    /* -------------------------------------------------------- */
    /* Conversão para DTO                                       */
    /* -------------------------------------------------------- */
    private CartDTO toDTO(Cart cart) {

        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(ci -> {

                    Product product = productRepo.findById(ci.getProductId()).orElse(null);
                    ProductVariation variation = (ci.getVariationId() != null)
                            ? variationRepo.findById(ci.getVariationId()).orElse(null)
                            : null;

                    /* -------- validação: se não encontrar, ignora o item -------- */
                    if (product == null) {
                        // opcional: você pode lançar RuntimeException("Produto não encontrado")
                        return null; // será filtrado depois
                    }

                    String name = (variation != null && variation.getName() != null)
                            ? variation.getName()
                            : product.getName();

                    String image = null;
                    if (variation != null && variation.getVariationImages() != null
                            && !variation.getVariationImages().isEmpty()) {
                        image = variation.getVariationImages().get(0).getImageUrl();
                    } else if (product.getImages() != null && !product.getImages().isEmpty()) {
                        image = product.getImages().get(0);
                    }

                    BigDecimal unitPrice = (variation != null && variation.getPrice() != null)
                            ? variation.getPrice()
                            : product.getSalePrice();

                    BigDecimal discount  = (variation != null && variation.getDiscountPrice() != null)
                            ? variation.getDiscountPrice()
                            : product.getDiscountPrice();

                    return new CartItemDTO(
                            ci.getId(),
                            ci.getProductId(),
                            ci.getVariationId(),
                            name,
                            image,
                            unitPrice,
                            discount,
                            ci.getQuantity()
                    );
                })
                .filter(Objects::nonNull)  // remove itens inválidos
                .collect(Collectors.toList());

        BigDecimal total = itemDTOs.stream()
                .map(i -> (i.getDiscountPrice() != null ? i.getDiscountPrice() : i.getUnitPrice())
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String peopleId = cart.getPeople() != null ? cart.getPeople().getId() : null;
        return new CartDTO(cart.getId(), peopleId, itemDTOs, total);
    }

}