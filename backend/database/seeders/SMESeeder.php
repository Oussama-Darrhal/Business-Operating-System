<?php

namespace Database\Seeders;

use App\Models\SME;
use Illuminate\Database\Seeder;

class SMESeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $smes = [
            [
                'name' => 'TechCorp Solutions',
                'business_type' => 'technology',
                'description' => 'A leading technology company specializing in innovative software solutions and digital transformation services for small and medium enterprises.',
                'founded_year' => 2020,
                'company_size' => '10-50',
                'email' => 'contact@techcorp.com',
                'phone' => '+1 (555) 123-4567',
                'website' => 'https://www.techcorp.com',
                'address' => '123 Innovation Drive, Suite 100',
                'city' => 'San Francisco',
                'state' => 'CA',
                'zip_code' => '94105',
                'country' => 'United States',
                'timezone' => 'America/Los_Angeles',
                'currency' => 'USD',
                'business_hours' => 'Monday - Friday: 9:00 AM - 5:00 PM PST',
                'tax_id' => '12-3456789',
                'logo_url' => null,
                'subscription_plan' => 'premium',
                'status' => 'active',
            ],
            [
                'name' => 'Green Foods Market',
                'business_type' => 'retail',
                'description' => 'Organic food retailer committed to providing fresh, locally-sourced produce and sustainable food products.',
                'founded_year' => 2018,
                'company_size' => '1-10',
                'email' => 'info@greenfoods.com',
                'phone' => '+1 (555) 987-6543',
                'website' => 'https://www.greenfoods.com',
                'address' => '456 Organic Street',
                'city' => 'Portland',
                'state' => 'OR',
                'zip_code' => '97201',
                'country' => 'United States',
                'timezone' => 'America/Los_Angeles',
                'currency' => 'USD',
                'business_hours' => 'Monday - Saturday: 8:00 AM - 8:00 PM PST',
                'tax_id' => '98-7654321',
                'logo_url' => null,
                'subscription_plan' => 'basic',
                'status' => 'active',
            ],
            [
                'name' => 'MediCare Clinic',
                'business_type' => 'healthcare',
                'description' => 'Modern healthcare clinic providing comprehensive medical services with a focus on preventive care and patient wellness.',
                'founded_year' => 2015,
                'company_size' => '50-200',
                'email' => 'contact@medicare-clinic.com',
                'phone' => '+1 (555) 246-8135',
                'website' => 'https://www.medicare-clinic.com',
                'address' => '789 Health Avenue',
                'city' => 'Boston',
                'state' => 'MA',
                'zip_code' => '02101',
                'country' => 'United States',
                'timezone' => 'America/New_York',
                'currency' => 'USD',
                'business_hours' => 'Monday - Friday: 7:00 AM - 7:00 PM EST',
                'tax_id' => '55-1234567',
                'logo_url' => null,
                'subscription_plan' => 'enterprise',
                'status' => 'active',
            ],
            [
                'name' => 'BuildCraft Manufacturing',
                'business_type' => 'manufacturing',
                'description' => 'Industrial manufacturing company specializing in custom metal fabrication and precision engineering solutions.',
                'founded_year' => 2012,
                'company_size' => '200-1000',
                'email' => 'info@buildcraft.com',
                'phone' => '+1 (555) 369-2580',
                'website' => 'https://www.buildcraft.com',
                'address' => '321 Industrial Blvd',
                'city' => 'Detroit',
                'state' => 'MI',
                'zip_code' => '48201',
                'country' => 'United States',
                'timezone' => 'America/Detroit',
                'currency' => 'USD',
                'business_hours' => 'Monday - Friday: 6:00 AM - 6:00 PM EST',
                'tax_id' => '33-9876543',
                'logo_url' => null,
                'subscription_plan' => 'premium',
                'status' => 'active',
            ],
            [
                'name' => 'EduLearn Academy',
                'business_type' => 'education',
                'description' => 'Online education platform offering professional development courses and certification programs for working professionals.',
                'founded_year' => 2019,
                'company_size' => '10-50',
                'email' => 'admin@edulearn.com',
                'phone' => '+1 (555) 147-2583',
                'website' => 'https://www.edulearn.com',
                'address' => '654 Knowledge Street',
                'city' => 'Austin',
                'state' => 'TX',
                'zip_code' => '73301',
                'country' => 'United States',
                'timezone' => 'America/Chicago',
                'currency' => 'USD',
                'business_hours' => 'Monday - Friday: 8:00 AM - 6:00 PM CST',
                'tax_id' => '77-5432198',
                'logo_url' => null,
                'subscription_plan' => 'basic',
                'status' => 'active',
            ],
        ];

        foreach ($smes as $smeData) {
            SME::create($smeData);
        }
    }
}
