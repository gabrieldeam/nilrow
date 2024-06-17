package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.address.Address;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, String> {
    List<Address> findByPeople(People people);
}
