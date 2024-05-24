package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeopleRepository extends JpaRepository<People, String> {
    People findByEmail(String email);
    People findByCpf(String cpf);
    People findByPhone(String phone);
    People findByValidationToken(String validationToken);
    People findByUser(User user);
}
