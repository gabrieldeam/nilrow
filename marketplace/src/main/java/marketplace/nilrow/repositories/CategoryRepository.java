package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
}

