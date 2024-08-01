package marketplace.nilrow.domain.channel.about;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AboutDTO {
    private String id;
    private String channelId;
    private String aboutText;
    private String storePolicies;
    private String exchangesAndReturns;
    private String additionalInfo;

    public AboutDTO(String channelId, String aboutText, String storePolicies, String exchangesAndReturns, String additionalInfo) {
        this.channelId = channelId;
        this.aboutText = aboutText;
        this.storePolicies = storePolicies;
        this.exchangesAndReturns = exchangesAndReturns;
        this.additionalInfo = additionalInfo;
    }
}
