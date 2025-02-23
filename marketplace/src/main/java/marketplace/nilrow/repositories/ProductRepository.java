package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCatalogId(String catalogId);
    List<Product> findByProductTemplateIsNull();
    List<Product> findByProductTemplateIsNullAndNameContainingIgnoreCase(String name);
}
