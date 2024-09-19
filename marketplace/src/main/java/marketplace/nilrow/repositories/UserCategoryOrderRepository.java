package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrder;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserCategoryOrderRepository extends JpaRepository<UserCategoryOrder, String> {
    List<UserCategoryOrder> findByPeople(People people);
    Optional<UserCategoryOrder> findByPeopleAndCategory(People people, Category category);
}

