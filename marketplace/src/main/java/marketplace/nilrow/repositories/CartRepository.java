package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, String> {
    Optional<Cart> findByPeopleId(String peopleId);
}