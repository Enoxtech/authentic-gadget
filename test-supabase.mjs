import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnrtcmffccxwtruwploo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucnRjbWZmY3h3dHJ1d3Bsb28iLCJyb2xlIjoiYW5vbiIsImNsaWVudCI6ImFub24iLCJpYXQiOjE3NDcwODU1MDB9.OHe8jddBHmX6MzNxbN-t6X1Q0O0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  const { data, error } = await supabase.from('orders').select('id').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
  
  const { data: productsData, error: productsError } = await supabase.from('products').select('id').limit(1);
  console.log('Products error:', productsError);
  console.log('Products data:', productsData);
  
  const { data: customersData, error: customersError } = await supabase.from('customers').select('id').limit(1);
  console.log('Customers error:', customersError);
  console.log('Customers data:', customersData);
}

test().catch(console.error);