package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplateVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariationTemplateRepository extends JpaRepository<ProductTemplateVariation, String> {
}
