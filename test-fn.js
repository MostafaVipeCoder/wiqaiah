const fn = async () => {
    const response = await fetch('https://vbzqsermgzlcbpsjvihq.supabase.co/functions/v1/send-booking-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Test",
        email: "test@example.com",
        date: "2023-10-10",
        startTime: "10:00",
        meetingLink: "https://zoom.us/j/123"
      })
    });
    const text = await response.text();
    console.log(response.status, text);
};
fn();
