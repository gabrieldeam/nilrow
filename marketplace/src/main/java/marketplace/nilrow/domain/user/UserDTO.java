package marketplace.nilrow.domain.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserDTO {
    private String id;
    private String nickname;
    private String peopleId;
    private String name;
    private String email;
    private String phone;
    private String cpf;
    private LocalDate birthDate;
    private UserRole role;

    public UserDTO(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.peopleId = user.getPeople().getId();
        this.name = user.getPeople().getName();
        this.email = user.getPeople().getEmail();
        this.phone = user.getPeople().getPhone();
        this.cpf = user.getPeople().getCpf();
        this.birthDate = user.getPeople().getBirthDate();
        this.role = user.getRole();
    }
}
