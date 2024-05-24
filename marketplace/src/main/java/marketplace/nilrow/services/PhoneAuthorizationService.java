package marketplace.nilrow.services;

import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PhoneAuthorizationService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(PhoneAuthorizationService.class);

    @Autowired
    private PeopleRepository peopleRepository;

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        logger.debug("Trying to load user by phone: {}", phone);
        People people = peopleRepository.findByPhone(phone);
        if (people == null || people.getUser() == null) {
            logger.debug("User not found with phone: {}", phone);
            throw new UsernameNotFoundException("User not found with phone: " + phone);
        }
        logger.debug("User found: {}", people.getUser().getNickname());
        return people.getUser();
    }
}
