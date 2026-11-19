from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0006_supportrequest")]

    operations = [
        migrations.AddField(
            model_name="userlistener",
            name="google_subject",
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
