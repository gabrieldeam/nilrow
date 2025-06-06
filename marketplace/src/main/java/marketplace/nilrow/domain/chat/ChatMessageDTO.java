package marketplace.nilrow.domain.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String id;
    private String content;
    private String senderType;
    private boolean seen;
    @JsonProperty("isSender")
    private boolean isSender;
    private LocalDateTime sentAt;
    private String contentType;

    public ChatMessageDTO(ChatMessage message, String senderType, boolean isSender) {
        this.id = message.getId();
        this.content = message.getContent();
        this.senderType = senderType;
        this.seen = message.isSeen();
        this.sentAt = message.getSentAt();
        this.isSender = isSender;
        this.contentType = message.getContentType();
    }
}
