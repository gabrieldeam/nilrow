package marketplace.nilrow.domain.user;

import lombok.Getter;
import lombok.Setter;
import marketplace.nilrow.validation.ValidNickname;

@Getter
@Setter
public class UpdateNicknameDTO {
    
    private String newNickname;
}
