package marketplace.nilrow.domain.channel.about;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FAQDTO {
    private String id;
    private String question;
    private String answer;
    private String aboutId; // Referência ao About relacionado
}