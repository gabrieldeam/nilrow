package marketplace.nilrow.domain.product;

public record PartialRequestProductDTO(
        String id,
        String name,
        Integer price_in_cents
) {
}
