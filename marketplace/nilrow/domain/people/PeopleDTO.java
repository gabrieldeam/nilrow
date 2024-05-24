package marketplace.nilrow.domain.people;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PeopleDTO {
    private String name;
    private String email;
    private String cpf;
    private String phone;
    private LocalDate birthDate;


    public PeopleDTO(People people) {
        this.name = people.getName();
        this.email = people.getEmail();
        this.cpf = people.getCpf();
        this.phone = people.getPhone();
        this.birthDate = people.getBirthDate();
    }
}
