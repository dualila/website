<script>
  // Format: new Date(Year, MonthIndex, Day, Hour, Minute)
  // NOTE: Months are 0-indexed (0 = January, 1 = February, 11 = December)
  const birthDate = new Date(2000, 8, 30, 0, 30); 

  function updateAge() {
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = now - birthDate;
    
    // Average milliseconds in a single Gregorian year (including leap years)
    const msInYear = 31556952000; 
    
    // Calculate age to 9 decimal places
    const exactAge = (diffInMs / msInYear).toFixed(9);
    
    // Push into the HTML element
    document.getElementById('exact-age').textContent = exactAge;
  }

  // Run immediately, then refresh at a super fast frame rate for smooth ticking
  updateAge();
  setInterval(updateAge, 50);
</script>