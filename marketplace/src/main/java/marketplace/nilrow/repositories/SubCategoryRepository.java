package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {
    List<SubCategory> findByCategoryId(String categoryId);
}
