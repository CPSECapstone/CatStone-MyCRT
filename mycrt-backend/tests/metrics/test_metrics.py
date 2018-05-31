from datetime import datetime, timedelta
import unittest
from src.metrics.metrics import calculate_period


class TestMetrics(unittest.TestCase):
    def test_shortest_period(self):
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=1)
        period = calculate_period(start_time, end_time)
        assert period == 1

    def test_short_period(self):
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=1001)
        period = calculate_period(start_time, end_time)
        assert period == 10

    def test_medium_period(self):
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=3001)
        period = calculate_period(start_time, end_time)
        assert period == 30

    def test_medium_period(self):
        seconds = 7000
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=seconds)
        period = calculate_period(start_time, end_time)
        assert period == int(round((seconds/100)/60) * 60.0)


if __name__ == '__main__':
    unittest.main()
