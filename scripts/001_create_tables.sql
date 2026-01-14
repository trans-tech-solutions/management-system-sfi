-- Create materials_prices table to store the price paid per kg for each material type
CREATE TABLE IF NOT EXISTS public.materials_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name TEXT NOT NULL UNIQUE,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table to store daily purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name TEXT NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table to track current stock
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name TEXT NOT NULL UNIQUE,
  quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.materials_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since this is an internal system)
-- Materials Prices policies
CREATE POLICY "Allow all operations on materials_prices" ON public.materials_prices
  FOR ALL USING (true) WITH CHECK (true);

-- Purchases policies
CREATE POLICY "Allow all operations on purchases" ON public.purchases
  FOR ALL USING (true) WITH CHECK (true);

-- Inventory policies
CREATE POLICY "Allow all operations on inventory" ON public.inventory
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some default materials with initial prices
INSERT INTO public.materials_prices (material_name, price_per_kg) VALUES
  ('Alumínio', 5.50),
  ('Cobre', 25.00),
  ('Ferro', 0.80),
  ('Latão', 18.00),
  ('Bronze', 22.00),
  ('Aço Inox', 8.50),
  ('Sucata Mista', 0.50),
  ('Papel', 0.30),
  ('Papelão', 0.40),
  ('Plástico', 0.60)
ON CONFLICT (material_name) DO NOTHING;

-- Create function to update inventory after purchase
CREATE OR REPLACE FUNCTION update_inventory_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update inventory
  INSERT INTO public.inventory (material_name, quantity_kg, last_updated)
  VALUES (NEW.material_name, NEW.quantity_kg, NOW())
  ON CONFLICT (material_name) 
  DO UPDATE SET 
    quantity_kg = inventory.quantity_kg + NEW.quantity_kg,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory when a purchase is made
DROP TRIGGER IF EXISTS trigger_update_inventory ON public.purchases;
CREATE TRIGGER trigger_update_inventory
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_after_purchase();
