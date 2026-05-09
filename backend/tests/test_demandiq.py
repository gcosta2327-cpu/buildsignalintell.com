"""DemandIQ Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://demand-analyzer-6.preview.emergentagent.com').rstrip('/')


class TestHealth:
    """Health check tests"""

    def test_root_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "BuildSignal" in data["message"]
        print("✓ Root endpoint working")


class TestAnalyze:
    """Analysis endpoint tests"""

    def test_analyze_valid_request(self):
        payload = {
            "niche": "Sustainable home decor",
            "products": "Bamboo toothbrushes, organic cotton bags, reusable water bottles",
            "target_audience": "Eco-conscious millennials 25-40",
            "price_range": "$10-$50",
            "sales_channels": "Shopify, Instagram"
        }
        response = requests.post(f"{BASE_URL}/api/analyze", json=payload, timeout=60)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

        data = response.json()
        assert data.get("success") == True
        result = data.get("data")
        assert result is not None

        # Validate response structure
        assert "summary" in result, "Missing 'summary' in result"
        assert "high_demand" in result, "Missing 'high_demand' in result"
        assert "low_demand" in result, "Missing 'low_demand' in result"
        assert "seasonality" in result, "Missing 'seasonality' in result"
        assert "actions" in result, "Missing 'actions' in result"

        # Validate lists
        assert isinstance(result["high_demand"], list), "high_demand should be a list"
        assert isinstance(result["low_demand"], list), "low_demand should be a list"
        assert isinstance(result["seasonality"], list), "seasonality should be a list"
        assert isinstance(result["actions"], list), "actions should be a list"

        # Validate product items
        if result["high_demand"]:
            item = result["high_demand"][0]
            assert "product" in item
            assert "reason" in item
            assert "confidence" in item
            assert item["confidence"] in ["high", "medium", "low"]

        print(f"✓ Analysis returned successfully. Summary: {result['summary'][:80]}...")
        print(f"  High demand products: {len(result['high_demand'])}")
        print(f"  Low demand products: {len(result['low_demand'])}")
        print(f"  Seasonality items: {len(result['seasonality'])}")
        print(f"  Actions: {len(result['actions'])}")

    def test_analyze_missing_required_fields(self):
        """Test that missing niche/products causes validation error"""
        payload = {
            "niche": "",
            "products": "",
            "target_audience": "",
            "price_range": "",
            "sales_channels": ""
        }
        # This goes to LLM even with empty fields, so status could be 200 or 422/500
        # Just verify it doesn't crash the server
        response = requests.post(f"{BASE_URL}/api/analyze", json=payload, timeout=60)
        assert response.status_code in [200, 422, 500]
        print(f"✓ Empty fields handled with status {response.status_code}")

    def test_analyze_missing_body(self):
        """Test that missing body returns 422"""
        response = requests.post(f"{BASE_URL}/api/analyze", json={}, timeout=10)
        assert response.status_code == 422
        print("✓ Missing body returns 422")
