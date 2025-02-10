from rest_framework import serializers
from .models import Dataset

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'name', 'features', 'records']

    def create(self, validated_data):
        """
        Customise the create method to ensure that the data is stored in the database and perform data format validation
        """
        features = validated_data.get('features', [])
        records = validated_data.get('records', [])

        # Make sure features is a non-empty list
        if not isinstance(features, list) or len(features) == 0:
            raise serializers.ValidationError({"features": "Features must be a non-empty list."})

        # Ensure that records are a list and that each record is a dictionary
        if not isinstance(records, list) or not all(isinstance(record, dict) for record in records):
            raise serializers.ValidationError({"records": "Records must be a list of dictionaries."})

        # Access to database
        dataset = Dataset.objects.create(
            name=validated_data.get('name', "Untitled Dataset"),
            features=features,
            records=records
        )
        return dataset
