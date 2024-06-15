package marketplace.nilrow.util;

import java.util.Arrays;
import java.util.List;

public class ForbiddenWordsUtil {
    public static final List<String> FORBIDDEN_WORDS = Arrays.asList("admin", "root", "superuser");

    public static boolean containsForbiddenWord(String nickname) {
        for (String word : FORBIDDEN_WORDS) {
            if (nickname.toLowerCase().contains(word)) {
                return true;
            }
        }
        return false;
    }
}
