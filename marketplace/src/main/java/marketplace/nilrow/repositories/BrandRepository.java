package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.brand.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, String> {
}
