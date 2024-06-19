package marketplace.nilrow.domain.people;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.address.Address;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.user.User;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "people")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class People {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String cpf;

    @Column(nullable = false)
    private String phone;

    private LocalDate birthDate;

    @Column(nullable = false)
    private boolean isEmailValidated = false;

    @Column
    private String validationToken;

    @Column
    private String resetPasswordCode;

    @Column(nullable = false)
    private boolean acceptsSms = false;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "people", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses;

    @OneToOne(mappedBy = "people", cascade = CascadeType.ALL, orphanRemoval = true)
    private Channel channel;

    public People(String name, String email, String phone, String cpf, LocalDate birthDate, User user) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.cpf = cpf;
        this.birthDate = birthDate;
        this.user = user;
    }

}
