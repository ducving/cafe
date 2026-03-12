import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = "AIzaSyDRFm64b_uCVfPmG9l4iu7Ytnvfinmk7ck"; 
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTIONS = `
Bạn là AI Assistant của cửa hàng Cafe Store. 
Nhiệm vụ của bạn là hỗ trợ khách hàng đặt bàn, chọn món trong menu, và giải đáp thắc mắc về quán.
Thông tin về quán:
- Địa chỉ: 123 Đường Sáng Tạo, Quận Bình Thạnh, TP. Hồ Chí Minh.
- Giờ mở cửa: 07:00 - 22:30 hàng ngày.
- Hotline: 0123 456 789.
- Menu chính: Cà phê (Robusta, Arabica), Trà trái cây (Trà đào, Trà dâu), Bánh ngọt (Tiramisu, Croissant).
- Đặc điểm: Không gian yên tĩnh, phù hợp làm việc và học tập. Có máy lạnh và Wifi tốc độ cao.
Hãy trả lời thân thiện, lịch sự và ngắn gọn bằng tiếng Việt.
Sử dụng các emoji phù hợp ☕🍰.
`;

export const getGeminiResponse = async (userInput: string, history: { role: string; parts: { text: string }[] }[]) => {
  try {
    if (!API_KEY || API_KEY.includes("YOUR_GEMINI_API_KEY")) {
      return "Chào bạn! Mình sẵn sàng hỗ trợ, nhưng bạn hãy cấu hình API Key trong file chatService.ts để mình có thể trò chuyện thông minh hơn nhé! ☕";
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTIONS,
    });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    if (error?.status === 429) {
      return "Bot đang bận một chút vì có quá nhiều câu hỏi. Bạn vui lòng đợi khoảng 1 phút rồi thử lại nhé! ☕✨";
    }
    return `Lỗi từ API: ${error?.message || "Đã có lỗi xảy ra. Hãy thử lại sau ít phút."}`;
  }
};
