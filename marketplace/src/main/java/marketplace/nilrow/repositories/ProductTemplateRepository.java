package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.template.ProductTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductTemplateRepository extends JpaRepository<ProductTemplate, String> {
    Page<ProductTemplate> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
