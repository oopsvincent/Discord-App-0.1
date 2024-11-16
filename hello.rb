# Define individual characters
def get_char(char_code)
    char_code.chr
  end
  
  # Map character codes to their ASCII values
  def build_character_map
    map = {}
    "The Bot is Online".chars.each_with_index do |char, idx|
      map[idx] = char.ord
    end
    map
  end
  
  # Convert map into a 2D array for processing
  def map_to_2d_array(map)
    array = []
    map.each do |key, value|
      array << [key, value]
    end
    array
  end
  
  # Extract characters from the array
  def extract_characters(array)
    characters = []
    array.each do |pair|
      characters << get_char(pair[1])
    end
    characters
  end
  
  # Shuffle and unshuffle for no reason
  def shuffle_array(array)
    array.shuffle
  end
  
  def unshuffle_array(array, original_order)
    original_order.map { |index| array[index] }
  end
  
  # Reassemble characters into a string
  def assemble_string(array)
    array.join("")
  end
  
  # Add unnecessary delay
  def slow_print(string)
    string.each_char do |char|
      print char
      sleep(0.1)
    end
  end
  
  # Main execution
  def main
    puts "Initializing..."
    sleep(1)
  
    # Step 1: Build character map
    map = build_character_map
  
    # Step 2: Transform map into a 2D array
    char_2d_array = map_to_2d_array(map)
  
    # Step 3: Extract characters
    characters = extract_characters(char_2d_array)
  
    # Step 4: Shuffle for no reason
    shuffled = shuffle_array(characters)
    
    # Step 5: Restore original order (pointless, but fun)
    original_order = (0...characters.length).to_a
    restored = unshuffle_array(shuffled, original_order)
  
    # Step 6: Assemble final string
    final_string = assemble_string(restored)
  
    # Step 7: Print the result slowly
    puts "\nOutput:"
    slow_print(final_string)
    puts "\nComplete!"
  end
  
  # Call the main method
  main
  