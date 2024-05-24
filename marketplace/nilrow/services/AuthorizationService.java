package marketplace.nilrow.services;

import marketplace.nilrow.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService implements UserDetailsService {

    @Autowired
    UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        UserDetails user = repository.findByNickname(login);
        if (user == null) {
            user = repository.findByPeople_Email(login);
            if (user == null) {
                throw new UsernameNotFoundException("User not found with login: " + login);
            }
        }
        return user;
    }
}
