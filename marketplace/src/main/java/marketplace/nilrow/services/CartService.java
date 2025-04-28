package marketplace.nilrow.services;

import marketplace.nilrow.domain.cart.*;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.channel.SimpleChannelDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.CartRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.ProductRepository;
import marketplace.nilrow.repositories.ProductVariationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import marketplace.nilrow.domain.catalog.product.VariationAttributeDTO;

import java.math.BigDecimal;
import java.util.Collections;
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

        // -------- validações básicas --------
        if ((req.getProductId() == null || req.getProductId().isBlank())
                && (req.getVariationId() == null || req.getVariationId().isBlank())) {
            throw new IllegalArgumentException("Envie productId ou variationId");
        }
        if (req.getQuantity() == null || req.getQuantity() == 0) {
            throw new IllegalArgumentException("Quantidade não pode ser 0");
        }

        // -------- recupera People e carrinho (ou cria) --------
        People people = peopleRepo.findById(peopleId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Cart cart = cartRepo.findByPeopleId(peopleId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setPeople(people);
                    return c;
                });

        // resolve productId / variationId
        String productId   = req.getProductId();
        String variationId = req.getVariationId();

        if ((productId == null || productId.isBlank()) && variationId != null) {
            ProductVariation var = variationRepo.findById(variationId)
                    .orElseThrow(() -> new RuntimeException("Variação não encontrada"));
            productId = var.getProduct().getId();  // aqui reatribuímos productId
        }

        // **copiamos para variáveis finais antes do stream**
        final String pid = productId;
        final String vid = variationId;

        // localiza item existente usando pid/vid finais
        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getProductId().equals(pid) &&
                        ((vid == null && ci.getVariationId() == null) ||
                                (vid != null && vid.equals(ci.getVariationId()))))
                .findFirst()
                .orElse(null);

        // cálculo de estoque disponível, newQty etc. (igual ao código de validação anterior)...
        int existingQty = (item != null) ? item.getQuantity() : 0;
        int availableStock;
        if (vid != null) {
            ProductVariation var = variationRepo.findById(vid)
                    .orElseThrow(() -> new RuntimeException("Variação não encontrada"));
            availableStock = var.getStock();
        } else {
            Product prod = productRepo.findById(pid)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
            availableStock = prod.getStock();
        }
        int newQty = existingQty + req.getQuantity();
        if (newQty > availableStock) {
            throw new RuntimeException("Não é possível adicionar mais itens, pois o estoque disponível é de "
                    + availableStock + " unidades.");
        }

        // cria ou atualiza item no carrinho (usando pid/vid)...
        if (item == null) {
            if (req.getQuantity() < 0) {
                throw new IllegalArgumentException("Não é possível subtrair de um item que ainda não existe");
            }
            item = new CartItem();
            item.setCart(cart);
            item.setProductId(pid);
            item.setVariationId(vid);
            item.setQuantity(req.getQuantity());
            cart.getItems().add(item);
        } else {
            if (newQty <= 0) {
                cart.getItems().remove(item);
            } else {
                item.setQuantity(newQty);
            }
        }

        // persiste e retorna DTO
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

                    String catalogId = null;
                    if (variation != null && variation.getProduct() != null
                            && variation.getProduct().getCatalog() != null) {
                        catalogId = variation.getProduct().getCatalog().getId();
                    } else if (product.getCatalog() != null) {
                        catalogId = product.getCatalog().getId();
                    }

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

                    List<VariationAttributeDTO> attrs = (variation != null && variation.getAttributes() != null)
                            ? variation.getAttributes().stream()
                            .map(a -> new VariationAttributeDTO(
                                    a.getId(),
                                    a.getAttributeName(),
                                    a.getAttributeValue()
                            ))
                            .collect(Collectors.toList())
                            : Collections.emptyList();

                    SimpleChannelDTO channelDTO = null;
                    if (product.getCatalog() != null && product.getCatalog().getChannel() != null) {
                        channelDTO = new SimpleChannelDTO(product.getCatalog().getChannel());
                    }

                    return new CartItemDTO(
                            ci.getId(),
                            ci.getProductId(),
                            ci.getVariationId(),
                            name,
                            image,
                            unitPrice,
                            discount,
                            ci.getQuantity(),
                            attrs,
                            channelDTO,
                            catalogId
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        BigDecimal total = itemDTOs.stream()
                .map(i -> (i.getDiscountPrice() != null ? i.getDiscountPrice() : i.getUnitPrice())
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String peopleId = cart.getPeople() != null ? cart.getPeople().getId() : null;
        return new CartDTO(cart.getId(), peopleId, itemDTOs, total);
    }

}