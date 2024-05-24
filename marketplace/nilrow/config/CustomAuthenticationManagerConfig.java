package marketplace.nilrow.config;

import marketplace.nilrow.services.AuthorizationService;
import marketplace.nilrow.services.PhoneAuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationManagerConfig {

    private final AuthorizationService authorizationService;
    private final PhoneAuthorizationService phoneAuthorizationService;

    public CustomAuthenticationManagerConfig(AuthorizationService authorizationService,
                                             PhoneAuthorizationService phoneAuthorizationService) {
        this.authorizationService = authorizationService;
        this.phoneAuthorizationService = phoneAuthorizationService;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(authorizationService).passwordEncoder(passwordEncoder());
        auth.userDetailsService(phoneAuthorizationService).passwordEncoder(passwordEncoder());
    }
}
