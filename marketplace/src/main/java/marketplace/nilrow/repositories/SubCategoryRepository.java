package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {
}
