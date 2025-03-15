package marketplace.nilrow.domain.catalog.shipping;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "melhor_envio_tokens")
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class MelhorEnvioTokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Exemplo de campo para relacionar token a um usuário/lojista/canal
    private String ownerId;

    @Column(length = 2048)
    private String accessToken;

    @Column(length = 2048)
    private String refreshToken;

    private Long expiresIn;
    private Long createdAt;
}
