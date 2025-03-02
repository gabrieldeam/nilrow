package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {

    // Listagem paginada de todos os produtos
    @Override
    Page<Product> findAll(Pageable pageable);

    // Listagem paginada de produtos por catálogo
    Page<Product> findByCatalogId(String catalogId, Pageable pageable);
}
