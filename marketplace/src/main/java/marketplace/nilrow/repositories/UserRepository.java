package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

public interface UserRepository extends JpaRepository<User, String> {
   UserDetails findByNickname(String nickname);
   UserDetails findByPeople_Email(String email);
   Page<User> findAll(Pageable pageable);}
