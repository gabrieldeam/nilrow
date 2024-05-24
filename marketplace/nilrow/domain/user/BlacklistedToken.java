package marketplace.nilrow.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Table(name="blacklisted_token")
@Entity(name="blacklisted_token")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class BlacklistedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String token;

    @Column(nullable = false)
    private Instant expiresAt;

    public BlacklistedToken(String token, Instant expiresAt) {
        this.token = token;
        this.expiresAt = expiresAt;
    }
}
