from django import template

register = template.Library()


@register.simple_tag(takes_context=True)
def stage_title(context):
    return f'Stage {context["stage_disp"]} ({context["stage"].name})'
