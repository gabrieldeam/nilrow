package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, String> {

    // Listagem paginada de todos os produtos
    @Override
    Page<Product> findAll(Pageable pageable);

    // Listagem paginada de produtos por catálogo
    Page<Product> findByCatalogId(String catalogId, Pageable pageable);

    // Novo método de pesquisa por nome ou skuCode, ignorando case
    Page<Product> findByNameContainingIgnoreCaseOrSkuCodeContainingIgnoreCase(String name, String skuCode, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.catalog.id = :catalogId AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) OR LOWER(p.skuCode) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<Product> searchProductsByCatalog(@Param("catalogId") String catalogId,
                                          @Param("term") String term,
                                          Pageable pageable);

}
